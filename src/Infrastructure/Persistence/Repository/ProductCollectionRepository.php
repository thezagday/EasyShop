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
    public function findActiveByShop(Shop $shop, ?int $userId = null): array
    {
        $qb = $this->createQueryBuilder('c')
            ->andWhere('c.shop = :shop')
            ->andWhere('c.active = true')
            ->setParameter('shop', $shop);

        if ($userId) {
            $qb
                ->andWhere('(c.user IS NULL OR IDENTITY(c.user) = :userId)')
                ->addSelect('CASE WHEN IDENTITY(c.user) = :userId THEN 0 ELSE 1 END AS HIDDEN personalSort')
                ->setParameter('userId', $userId)
                ->orderBy('personalSort', 'ASC');
        } else {
            $qb
                ->andWhere('c.user IS NULL')
                ->orderBy('c.sortOrder', 'ASC');
        }

        return $qb
            ->addOrderBy('c.sortOrder', 'ASC')
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
