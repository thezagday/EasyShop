<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\UserActivity;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\DateTimeFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\EntityFilter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class UserActivityCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return UserActivity::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('User Activity')
            ->setEntityLabelInPlural('User Activity')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setPageTitle(Crud::PAGE_INDEX, 'User Activity Log')
            ->setSearchFields(['query']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('user')->setLabel('User');
        yield AssociationField::new('shop')->setLabel('Shop');
        yield TextField::new('query')->setLabel('Search Query');
        yield BooleanField::new('hasRoute', 'Route Built')->renderAsSwitch(false);
        yield TextField::new('routeCategoriesDisplay', 'Route');
        yield IntegerField::new('routeDistanceMeters')->setLabel('Distance (m)');
        yield IntegerField::new('routeTimeMinutes')->setLabel('Time (min)');
        yield DateTimeField::new('createdAt')->setLabel('Date');
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(EntityFilter::new('shop'))
            ->add(EntityFilter::new('user'))
            ->add(DateTimeFilter::new('createdAt'));
    }
}
