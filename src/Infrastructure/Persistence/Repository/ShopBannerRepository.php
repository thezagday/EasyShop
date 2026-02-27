<?php

namespace App\Infrastructure\Persistence\Repository;

use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopBanner;
use App\Domain\Repository\ShopBannerRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ShopBanner>
 */
class ShopBannerRepository extends ServiceEntityRepository implements ShopBannerRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShopBanner::class);
    }

    public function findById(int $id): ?ShopBanner
    {
        return parent::find($id);
    }

    public function save(ShopBanner $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ShopBanner $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findByShop(Shop $shop): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.shop = :shop')
            ->setParameter('shop', $shop)
            ->orderBy('b.sortOrder', 'ASC')
            ->addOrderBy('b.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveByShop(Shop $shop): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.shop = :shop')
            ->andWhere('b.active = :active')
            ->setParameter('shop', $shop)
            ->setParameter('active', true)
            ->orderBy('b.sortOrder', 'ASC')
            ->addOrderBy('b.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
