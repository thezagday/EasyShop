<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Retailer;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;

#[IsGranted('ROLE_ADMIN')]
class RetailerCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Retailer::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm(),
            TextField::new('title', new TranslatableMessage('retailer.fields.title', [], 'admin')),
        ];
    }
}
