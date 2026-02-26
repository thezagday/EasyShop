<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Application\Message\ProcessShopPdfToMapImageMessage;
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
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Form\Type\FileUploadType;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class ShopCrudController extends AbstractCrudController
{
    private const MAP_WIDTH = 1653;
    private const MAP_HEIGHT = 993;

    public function __construct(
        private AdminUrlGenerator $adminUrlGenerator,
        private MessageBusInterface $messageBus,
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

        $shopId = $shop->getId();
        if (!$shopId) {
            $this->addFlash('warning', 'Магазин должен быть сохранён перед обработкой PDF');
            return;
        }

        // Dispatch async message for PDF processing
        $message = new ProcessShopPdfToMapImageMessage($shopId, $pdfFile);
        $this->messageBus->dispatch($message);

        $this->addFlash('success', 'PDF файл загружен. Карта будет сгенерирована в фоновом режиме.');
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
            TextareaField::new('aiContext', 'Контекст для AI-помощника')
                ->setHelp('Системный контекст для AI: опишите тип заведения (магазин/склад), особенности ассортимента, специфику работы. Этот текст будет передаваться AI при генерации списка покупок.')
                ->setRequired(false)
                ->hideOnIndex(),
            AssociationField::new('retailer', 'Ритейлер'),
        ];
    }
}
