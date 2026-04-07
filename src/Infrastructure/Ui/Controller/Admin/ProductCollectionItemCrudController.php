<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ProductCollectionItem;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;

#[IsGranted('ROLE_ADMIN')]
class ProductCollectionItemCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ProductCollectionItem::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular(new TranslatableMessage('collection.item_label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('collection.item_label_plural', [], 'admin'))
            ->setDefaultSort(['collection' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm();
        yield AssociationField::new('collection')->setLabel(new TranslatableMessage('collection.label_singular', [], 'admin'));

        $commodityField = AssociationField::new('commodity')
            ->setLabel(new TranslatableMessage('collection.fields.commodity', [], 'admin'))
            ->autocomplete();

        if ($pageName === Crud::PAGE_EDIT) {
            $entity = $this->getContext()?->getEntity()?->getInstance();
            $shopId = $entity?->getCollection()?->getShop()?->getId();

            if ($shopId) {
                $commodityField->setQueryBuilder(function (QueryBuilder $qb) use ($shopId) {
                    return $qb
                        ->join('entity.shopCategories', 'sc')
                        ->andWhere('sc.shop = :shopId')
                        ->setParameter('shopId', $shopId)
                        ->orderBy('entity.title', 'ASC');
                });
                $commodityField->setHelp(new TranslatableMessage('collection.fields.commodity_help_edit', [], 'admin'));
            }
        }

        if ($pageName === Crud::PAGE_NEW) {
            $commodityField->setHelp(new TranslatableMessage('collection.fields.commodity_help_new', [], 'admin'));
        }

        yield $commodityField;
    }
}
