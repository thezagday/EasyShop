<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ProductCollection;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class ProductCollectionCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ProductCollection::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Подборка')
            ->setEntityLabelInPlural('Подборки')
            ->setDefaultSort(['sortOrder' => 'ASC', 'title' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('emoji')->setLabel('Emoji');
        yield TextField::new('title')->setLabel('Название');
        yield TextareaField::new('description')->setLabel('Описание');
        yield AssociationField::new('shop')->setLabel('Магазин');
        yield BooleanField::new('active')->setLabel('Активна');
        yield IntegerField::new('sortOrder')->setLabel('Порядок');
        yield AssociationField::new('items')->setLabel('Товары')->onlyOnDetail();
    }
}
