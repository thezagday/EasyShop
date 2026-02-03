<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Retailer;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class RetailerCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Retailer::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('title', 'Название'),
        ];
    }
}
