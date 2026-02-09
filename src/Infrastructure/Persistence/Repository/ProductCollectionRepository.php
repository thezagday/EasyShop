<?php

namespace App\Infrastructure\Persistence\Repository;

use App\Domain\Entity\ProductCollection;
use App\Domain\Entity\Shop;
use App\Domain\Repository\ProductCollectionRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProductCollection>
 */
class ProductCollectionRepository extends ServiceEntityRepository implements ProductCollectionRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProductCollection::class);
    }

    public function findById(int $id): ?ProductCollection
    {
        return parent::find($id);
    }

    /** @return ProductCollection[] */
    public function findActiveByShop(Shop $shop): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.shop = :shop')
            ->andWhere('c.active = true')
            ->setParameter('shop', $shop)
            ->orderBy('c.sortOrder', 'ASC')
            ->addOrderBy('c.title', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function save(ProductCollection $collection, bool $flush = false): void
    {
        $this->getEntityManager()->persist($collection);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ProductCollection $collection, bool $flush = false): void
    {
        $this->getEntityManager()->remove($collection);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
