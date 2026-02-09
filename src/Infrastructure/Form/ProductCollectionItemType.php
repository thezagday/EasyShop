<?php

namespace App\Infrastructure\Form;

use App\Domain\Entity\Commodity;
use App\Domain\Entity\ProductCollectionItem;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProductCollectionItemType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $shopId = $options['shop_id'];

        $builder->add('commodity', EntityType::class, [
            'class' => Commodity::class,
            'label' => false,
            'choice_label' => 'title',
            'query_builder' => function (EntityRepository $er) use ($shopId) {
                $qb = $er->createQueryBuilder('c')
                    ->orderBy('c.title', 'ASC');

                if ($shopId) {
                    $qb->join('c.shopCategories', 'sc')
                        ->andWhere('sc.shop = :shopId')
                        ->setParameter('shopId', $shopId);
                }

                return $qb;
            },
            'placeholder' => 'Выберите товар...',
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ProductCollectionItem::class,
            'shop_id' => null,
        ]);

        $resolver->setAllowedTypes('shop_id', ['int', 'null']);
    }
}
