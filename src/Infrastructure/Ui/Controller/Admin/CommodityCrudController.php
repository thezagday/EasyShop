<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Commodity;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;

#[IsGranted('ROLE_ADMIN')]
class CommodityCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Commodity::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular(new TranslatableMessage('commodity.label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('commodity.label_plural', [], 'admin'));
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm(),
            TextField::new('title', new TranslatableMessage('commodity.fields.title', [], 'admin')),
            NumberField::new('price', new TranslatableMessage('commodity.fields.price', [], 'admin'))->setNumDecimals(2),
            AssociationField::new('shopCategories', new TranslatableMessage('commodity.fields.shop_categories', [], 'admin'))->hideOnIndex(),
        ];
    }
}
