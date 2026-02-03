<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ShopCategory;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;

class ShopCategoryCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ShopCategory::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            AssociationField::new('shop', 'Магазин'),
            AssociationField::new('category', 'Категория'),
            NumberField::new('x_coordinate', 'X Координата'),
            NumberField::new('y_coordinate', 'Y Координата'),
            AssociationField::new('commodities', 'Товары')->hideOnIndex(),
        ];
    }
}
