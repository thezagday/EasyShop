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
use Symfony\Component\Translation\TranslatableMessage;

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
            ->setEntityLabelInSingular(new TranslatableMessage('user_activity.label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('user_activity.label_plural', [], 'admin'))
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setPageTitle(Crud::PAGE_INDEX, new TranslatableMessage('user_activity.page_title.index', [], 'admin'))
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
        yield IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm();
        yield AssociationField::new('user')->setLabel(new TranslatableMessage('user_activity.fields.user', [], 'admin'));
        yield AssociationField::new('shop')->setLabel(new TranslatableMessage('user_activity.fields.shop', [], 'admin'));
        yield TextField::new('query')->setLabel(new TranslatableMessage('user_activity.fields.query', [], 'admin'));
        yield BooleanField::new('hasRoute', new TranslatableMessage('user_activity.fields.has_route', [], 'admin'))->renderAsSwitch(false);
        yield TextField::new('routeCategoriesDisplay', new TranslatableMessage('user_activity.fields.route', [], 'admin'));
        yield IntegerField::new('routeDistanceMeters')->setLabel(new TranslatableMessage('user_activity.fields.distance', [], 'admin'));
        yield IntegerField::new('routeTimeMinutes')->setLabel(new TranslatableMessage('user_activity.fields.time', [], 'admin'));
        yield DateTimeField::new('createdAt')->setLabel(new TranslatableMessage('user_activity.fields.created_at', [], 'admin'));
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(EntityFilter::new('shop'))
            ->add(EntityFilter::new('user'))
            ->add(DateTimeFilter::new('createdAt'));
    }
}
