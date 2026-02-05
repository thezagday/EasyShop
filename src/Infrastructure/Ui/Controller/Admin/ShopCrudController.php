<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Shop;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;

class ShopCrudController extends AbstractCrudController
{
    public function __construct(
        private AdminUrlGenerator $adminUrlGenerator
    ) {
    }

    public static function getEntityFqcn(): string
    {
        return Shop::class;
    }

    public function configureActions(Actions $actions): Actions
    {
        $editMap = Action::new('editMap', 'Edit Map', 'fa fa-map')
            ->linkToRoute('admin_map_editor_edit', function (Shop $shop) {
                return ['id' => $shop->getId()];
            })
            ->setCssClass('btn btn-info');

        return $actions
            ->add(Crud::PAGE_INDEX, $editMap)
            ->add(Crud::PAGE_DETAIL, $editMap);
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('title', 'Название'),
            TextField::new('avatar', 'Имя файла аватара магазина (в public/img/)'),
            TextField::new('mapImage', 'Имя файла карты магазина (в public/img/)')
                ->setHelp('Карта используется для навигации покупателей и редактора препятствий'),
            AssociationField::new('retailer', 'Ритейлер'),
        ];
    }
}
