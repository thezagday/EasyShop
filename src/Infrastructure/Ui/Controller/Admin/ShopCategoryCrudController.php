<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ShopCategory;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;

#[IsGranted('ROLE_ADMIN')]
class ShopCategoryCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ShopCategory::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular(new TranslatableMessage('shop_category.label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('shop_category.label_plural', [], 'admin'));
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm(),
            AssociationField::new('shop', new TranslatableMessage('shop_category.fields.shop', [], 'admin')),
            AssociationField::new('category', new TranslatableMessage('shop_category.fields.category', [], 'admin')),
            NumberField::new('x_coordinate', new TranslatableMessage('shop_category.fields.x_coordinate', [], 'admin')),
            NumberField::new('y_coordinate', new TranslatableMessage('shop_category.fields.y_coordinate', [], 'admin')),
            AssociationField::new('commodities', new TranslatableMessage('shop_category.fields.commodities', [], 'admin'))->hideOnIndex(),
        ];
    }
}
