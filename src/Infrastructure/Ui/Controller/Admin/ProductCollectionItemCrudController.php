<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ProductCollectionItem;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use Symfony\Component\Security\Http\Attribute\IsGranted;

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
            ->setEntityLabelInSingular('Товар в подборке')
            ->setEntityLabelInPlural('Товары в подборках')
            ->setDefaultSort(['collection' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('collection')->setLabel('Подборка');

        $commodityField = AssociationField::new('commodity')
            ->setLabel('Товар')
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
                $commodityField->setHelp('Показаны только товары магазина подборки');
            }
        }

        if ($pageName === Crud::PAGE_NEW) {
            $commodityField->setHelp('Сначала сохраните, затем при редактировании будут показаны только товары нужного магазина. Выбирайте товар с правильным суффиксом магазина.');
        }

        yield $commodityField;
    }
}
