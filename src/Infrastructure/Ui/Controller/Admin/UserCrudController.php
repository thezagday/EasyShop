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

#[IsGranted('ROLE_ADMIN')]
class UserCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly AdminUrlGenerator $adminUrlGenerator
    ) {
    }

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Пользователь')
            ->setEntityLabelInPlural('Пользователи')
            ->setSearchFields(['email', 'userContext']);
    }

    public function configureActions(Actions $actions): Actions
    {
        $userCollections = Action::new('userCollections', 'Подборки', 'fas fa-gift')
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
        yield IdField::new('id')->hideOnForm();
        yield EmailField::new('email', 'Email');
        yield ArrayField::new('roles', 'Роли');
        yield TextareaField::new('userContext', 'Промпт / AI-контекст')
            ->setHelp('Контекст, который AI использует для персонализации ответов.')
            ->setNumOfRows(4)
            ->hideOnIndex();
        yield IntegerField::new('collectionsCount', 'Подборок')
            ->onlyOnDetail();
        yield IntegerField::new('statsTotalRoutes', 'Маршрутов')
            ->onlyOnDetail();
        yield IntegerField::new('statsTotalDistanceMeters', 'Дистанция (м)')
            ->onlyOnDetail();
        yield IntegerField::new('statsTotalTimeMinutes', 'Время (мин)')
            ->onlyOnDetail();
        yield TextField::new('statsTotalCostDisplay', 'Сумма (₽)')
            ->formatValue(static fn ($value) => $value !== null ? $value . ' ₽' : '0.00 ₽')
            ->onlyOnDetail();
        yield TextField::new('password', 'Пароль (хэш)')->hideOnIndex();
    }
}
