<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Commodity;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class CommodityCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Commodity::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('title', 'Название'),
            NumberField::new('price', 'Цена (₽)')->setNumDecimals(2),
            AssociationField::new('shopCategories', 'Категории в магазинах')->hideOnIndex(),
        ];
    }
}
