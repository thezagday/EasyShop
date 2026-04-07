<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\User;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;

#[IsGranted('ROLE_ADMIN')]
class UserCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly AdminUrlGenerator $adminUrlGenerator,
    ) {
    }

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular(new TranslatableMessage('user.label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('user.label_plural', [], 'admin'))
            ->setSearchFields(['email', 'userContext']);
    }

    public function configureActions(Actions $actions): Actions
    {
        $userCollections = Action::new('userCollections', new TranslatableMessage('collection.label_plural', [], 'admin'), 'fas fa-gift')
            ->linkToUrl(function (User $user): string {
                return $this->adminUrlGenerator
                    ->unsetAll()
                    ->setController(ProductCollectionCrudController::class)
                    ->setAction(Action::INDEX)
                    ->set('query', (string) $user->getEmail())
                    ->generateUrl();
            })
            ->setCssClass('btn btn-info');

        return $actions
            ->add(Crud::PAGE_INDEX, $userCollections)
            ->add(Crud::PAGE_DETAIL, $userCollections);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm();
        yield EmailField::new('email', new TranslatableMessage('user.fields.email', [], 'admin'));
        yield ArrayField::new('roles', new TranslatableMessage('user.fields.roles', [], 'admin'));
        yield TextareaField::new('userContext', new TranslatableMessage('user.fields.user_context', [], 'admin'))
            ->setHelp(new TranslatableMessage('user.fields.user_context_help', [], 'admin'))
            ->setNumOfRows(4)
            ->hideOnIndex();
        yield IntegerField::new('collectionsCount', new TranslatableMessage('user.fields.collections_count', [], 'admin'))
            ->onlyOnDetail();
        yield IntegerField::new('statsTotalRoutes', new TranslatableMessage('user.fields.stats_total_routes', [], 'admin'))
            ->onlyOnDetail();
        yield IntegerField::new('statsTotalDistanceMeters', new TranslatableMessage('user.fields.stats_total_distance', [], 'admin'))
            ->onlyOnDetail();
        yield IntegerField::new('statsTotalTimeMinutes', new TranslatableMessage('user.fields.stats_total_time', [], 'admin'))
            ->onlyOnDetail();
        yield TextField::new('statsTotalCostDisplay', new TranslatableMessage('user.fields.stats_total_cost', [], 'admin'))
            ->formatValue(static fn ($value) => $value !== null ? $value . ' ₽' : '0.00 ₽')
            ->onlyOnDetail();
        yield TextField::new('password', new TranslatableMessage('user.fields.password', [], 'admin'))->hideOnIndex();
    }
}
