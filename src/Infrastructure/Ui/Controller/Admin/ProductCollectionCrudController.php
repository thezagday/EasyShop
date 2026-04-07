<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Commodity;
use App\Domain\Entity\ProductCollection;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;

#[IsGranted('ROLE_ADMIN')]
class ProductCollectionCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ProductCollection::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular(new TranslatableMessage('collection.label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('collection.label_plural', [], 'admin'))
            ->setSearchFields(['title', 'description', 'user.email'])
            ->setDefaultSort(['sortOrder' => 'ASC', 'title' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm();
        yield TextField::new('emoji')->setLabel(new TranslatableMessage('collection.fields.emoji', [], 'admin'));
        yield TextField::new('title')->setLabel(new TranslatableMessage('collection.fields.title', [], 'admin'));
        yield TextareaField::new('description')->setLabel(new TranslatableMessage('collection.fields.description', [], 'admin'));
        yield AssociationField::new('user')->setLabel(new TranslatableMessage('collection.fields.user_owner', [], 'admin'));
        $shopField = AssociationField::new('shop')->setLabel(new TranslatableMessage('collection.fields.shop', [], 'admin'));
        if ($pageName === Crud::PAGE_EDIT) {
            $shopField->setDisabled();
        }
        yield $shopField;
        yield BooleanField::new('active')->setLabel(new TranslatableMessage('collection.fields.active', [], 'admin'));
        yield IntegerField::new('sortOrder')->setLabel(new TranslatableMessage('collection.fields.sort_order', [], 'admin'));

        $commoditiesField = AssociationField::new('commodities')
            ->setLabel(new TranslatableMessage('collection.fields.commodities', [], 'admin'));

        if ($pageName === Crud::PAGE_EDIT || $pageName === Crud::PAGE_NEW) {
            $entity = $this->getContext()?->getEntity()?->getInstance();
            $shopId = $entity?->getShop()?->getId();

            if ($shopId) {
                $commoditiesField->setQueryBuilder(function (QueryBuilder $qb) use ($shopId) {
                    return $qb
                        ->join('entity.shopCategories', 'sc')
                        ->andWhere('sc.shop = :shopId')
                        ->setParameter('shopId', $shopId)
                        ->orderBy('entity.title', 'ASC');
                });
            }
        }

        yield $commoditiesField;
    }
}
