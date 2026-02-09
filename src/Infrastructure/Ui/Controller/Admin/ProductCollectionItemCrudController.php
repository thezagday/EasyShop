<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ProductCollectionItem;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;

class ProductCollectionItemCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ProductCollectionItem::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Товар в подборке')
            ->setEntityLabelInPlural('Товары в подборках')
            ->setDefaultSort(['collection' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('collection')->setLabel('Подборка');
        yield AssociationField::new('commodity')->setLabel('Товар');
    }
}
