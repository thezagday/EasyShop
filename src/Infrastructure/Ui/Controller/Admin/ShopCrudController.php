<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Shop;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Form\Type\FileUploadType;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Process\Process;

class ShopCrudController extends AbstractCrudController
{
    private const MAP_WIDTH = 1653;
    private const MAP_HEIGHT = 993;
    private const PDF_RASTER_SCALE = 4;

    public function __construct(
        private AdminUrlGenerator $adminUrlGenerator,
        #[Autowire('%kernel.project_dir%')] private string $projectDir
    ) {
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof Shop) {
            $this->generateMapImageFromPdfIfNeeded($entityInstance);
        }

        parent::persistEntity($entityManager, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof Shop) {
            $this->generateMapImageFromPdfIfNeeded($entityInstance);
        }

        parent::updateEntity($entityManager, $entityInstance);
    }

    private function generateMapImageFromPdfIfNeeded(Shop $shop): void
    {
        $pdfFile = $shop->getPdfFile();
        if (!$pdfFile) {
            return;
        }

        if (!is_string($pdfFile)) {
            return;
        }

        $publicImgDir = $this->projectDir . '/public/img';

        if (!is_dir($publicImgDir)) {
            @mkdir($publicImgDir, 0775, true);
        }

        $pdfAbsPath = $publicImgDir . '/' . $pdfFile;

        if (!is_file($pdfAbsPath)) {
            $this->addFlash('danger', sprintf('PDF файл не найден: %s', $pdfAbsPath));
            return;
        }

        $baseName = pathinfo($pdfFile, PATHINFO_FILENAME);
        if ($baseName === '') {
            $this->addFlash('danger', 'Не удалось определить имя файла для PDF');
            return;
        }

        $pdfMTime = @filemtime($pdfAbsPath);
        if (!is_int($pdfMTime) || $pdfMTime <= 0) {
            $pdfMTime = time();
        }

        $outputBaseName = sprintf('%s-%d', $baseName, $pdfMTime);
        $pngFileName = $outputBaseName . '.png';
        $outputBaseAbsPath = $publicImgDir . '/' . $outputBaseName;

        $rawOutputBaseName = $outputBaseName . '-raw';
        $rawOutputBaseAbsPath = $publicImgDir . '/' . $rawOutputBaseName;
        $rawPngAbsPath = $publicImgDir . '/' . $rawOutputBaseName . '.png';

        $targetWidthPx = (string) (self::MAP_WIDTH * self::PDF_RASTER_SCALE);
        $targetHeightPx = (string) (self::MAP_HEIGHT * self::PDF_RASTER_SCALE);

        $renderProcess = new Process([
            'pdftocairo',
            '-png',
            '-f',
            '1',
            '-l',
            '1',
            '-singlefile',
            '-r',
            '600',
            $pdfAbsPath,
            $rawOutputBaseAbsPath,
        ]);
        $renderProcess->setTimeout(60);
        $renderProcess->run();

        if (!$renderProcess->isSuccessful()) {
            $this->addFlash('danger', 'Не удалось отрендерить PDF в PNG: ' . trim($renderProcess->getErrorOutput()));
            return;
        }

        if (!is_file($rawPngAbsPath)) {
            $this->addFlash('danger', sprintf('RAW PNG не был создан: %s', $rawPngAbsPath));
            return;
        }

        $pngAbsPath = $publicImgDir . '/' . $pngFileName;
        $extent = sprintf('%sx%s', $targetWidthPx, $targetHeightPx);

        $padProcess = new Process([
            'convert',
            $rawPngAbsPath,
            '-resize',
            $extent,
            '-background',
            'white',
            '-gravity',
            'center',
            '-extent',
            $extent,
            $pngAbsPath,
        ]);
        $padProcess->setTimeout(60);
        $padProcess->run();

        if (!$padProcess->isSuccessful()) {
            $this->addFlash('danger', 'Не удалось подготовить PNG (padding): ' . trim($padProcess->getErrorOutput()));
            return;
        }

        if (!is_file($pngAbsPath)) {
            $this->addFlash('danger', sprintf('PNG не был создан: %s', $pngAbsPath));
            return;
        }

        @unlink($rawPngAbsPath);

        $shop->setMapImage($pngFileName);
    }

    public static function getEntityFqcn(): string
    {
        return Shop::class;
    }

    public function configureActions(Actions $actions): Actions
    {
        $editMap = Action::new('editMap', 'Edit Map', 'fa fa-map')
            ->linkToCrudAction('editMap')
            ->setCssClass('btn btn-info');

        return $actions
            ->add(Crud::PAGE_INDEX, $editMap)
            ->add(Crud::PAGE_DETAIL, $editMap);
    }

    public function editMap(AdminContext $context): Response
    {
        $shop = $context->getEntity()->getInstance();

        if (!$shop instanceof Shop) {
            throw $this->createNotFoundException('Shop not found');
        }

        $mapImage = $shop->getMapImage();

        if (!$mapImage) {
            $this->addFlash('warning', 'Для этого магазина не загружена карта. Пожалуйста, загрузите карту в поле "Имя файла карты магазина".');

            return $this->redirect(
                $this->adminUrlGenerator
                    ->setController(self::class)
                    ->setAction(Action::EDIT)
                    ->setEntityId($shop->getId())
                    ->generateUrl()
            );
        }

        return $this->render('admin/map_editor/edit.html.twig', [
            'ea' => $context,
            'shop' => $shop,
            'mapImageUrl' => '/img/' . $mapImage,
            'mapWidth' => self::MAP_WIDTH,
            'mapHeight' => self::MAP_HEIGHT,
        ]);
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('title', 'Название'),
            TextField::new('avatar', 'Имя файла аватара магазина (в public/img/)'),
            TextField::new('mapImage', 'Карта (имя файла)')
                ->onlyOnIndex(),
            ImageField::new('mapImage', 'Карта магазина')
                ->setHelp('Карта используется для навигации покупателей и редактора препятствий')
                ->setBasePath('/img')
                ->setUploadDir('public/img')
                ->setUploadedFileNamePattern('[name].[extension]')
                ->setRequired(false)
                ->onlyOnForms(),
            TextField::new('pdfFile', 'PDF (имя файла)')
                ->formatValue(static function ($value) {
                    if (!$value) {
                        return '';
                    }

                    $href = '/img/' . $value;
                    return sprintf('<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>', $href, $value);
                })
                ->renderAsHtml()
                ->onlyOnIndex(),
            TextField::new('pdfFile', 'PDF файл')
                ->setHelp('PDF будет сохранён в public/img')
                ->setFormType(FileUploadType::class)
                ->setFormTypeOption('upload_dir', 'public/img')
                ->setFormTypeOption('upload_filename', '[name].[extension]')
                ->setFormTypeOption('attr', ['accept' => 'application/pdf'])
                ->setRequired(false)
                ->onlyOnForms(),
            AssociationField::new('retailer', 'Ритейлер'),
        ];
    }
}
