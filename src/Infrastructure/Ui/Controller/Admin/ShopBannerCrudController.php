<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ShopBanner;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class ShopBannerCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ShopBanner::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Рекламный баннер')
            ->setEntityLabelInPlural('Рекламные баннеры')
            ->setSearchFields(['title', 'shop.title'])
            ->setDefaultSort(['sortOrder' => 'ASC', 'id' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('shop', 'Магазин');
        yield TextField::new('title', 'Название');
        yield TextField::new('imageFile', 'Файл изображения')->onlyOnIndex();
        yield TextField::new('resolvedImageUrl', 'Превью')
            ->formatValue(static function ($value, ?ShopBanner $entity): string {
                if (!$value) {
                    return '<span class="text-muted">Нет изображения</span>';
                }

                $source = $entity?->getImageFile() ? 'uploaded' : 'external';

                return sprintf(
                    '<div style="display:flex;align-items:center;gap:8px"><img src="%s" alt="banner" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #ddd"><span style="font-size:12px;color:#666">%s</span></div>',
                    htmlspecialchars($value, ENT_QUOTES),
                    $source
                );
            })
            ->renderAsHtml()
            ->onlyOnIndex();
        yield ImageField::new('imageFile', 'Загрузить изображение')
            ->setHelp('Файл загрузится в public/img. Если загружен файл, он будет использоваться вместо внешней ссылки.')
            ->setBasePath('/img')
            ->setUploadDir('public/img')
            ->setUploadedFileNamePattern('[name]-[timestamp].[extension]')
            ->setFormTypeOption('attr', ['accept' => 'image/*'])
            ->setRequired(false)
            ->onlyOnForms();
        yield TextField::new('resolvedImageUrl', 'Используемое изображение')
            ->setHelp('Это итоговый URL, который увидит пользователь на карте (сначала берется загруженный файл, иначе внешняя ссылка).')
            ->setFormTypeOption('disabled', true)
            ->setRequired(false)
            ->onlyOnForms();
        yield TextField::new('imageUrl', 'Внешняя ссылка на изображение')
            ->setHelp('Опционально: полный URL до внешнего изображения, если не загружаете файл.')
            ->setRequired(false);
        yield TextField::new('targetUrl', 'Ссылка перехода')->setRequired(false);
        yield NumberField::new('x_coordinate', 'X координата')->setRequired(false);
        yield NumberField::new('y_coordinate', 'Y координата')->setRequired(false);
        yield BooleanField::new('active', 'Активный');
        yield IntegerField::new('sortOrder', 'Порядок');
    }
}
