<?php

namespace App\Infrastructure\Persistence\Repository;

use App\Domain\Entity\Obstacle;
use App\Domain\Entity\Shop;
use App\Domain\Repository\ObstacleRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Obstacle>
 */
class ObstacleRepository extends ServiceEntityRepository implements ObstacleRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Obstacle::class);
    }

    public function findById(int $id): ?Obstacle
    {
        return parent::find($id);
    }

    public function save(Obstacle $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Obstacle $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find all obstacles for a specific shop
     *
     * @param Shop $shop
     * @return Obstacle[]
     */
    public function findByShop(Shop $shop): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.shop = :shop')
            ->setParameter('shop', $shop)
            ->orderBy('o.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find obstacles by shop ID
     *
     * @param int $shopId
     * @return Obstacle[]
     */
    public function findByShopId(int $shopId): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.shop = :shopId')
            ->setParameter('shopId', $shopId)
            ->orderBy('o.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find obstacles by type
     *
     * @param Shop $shop
     * @param string $type
     * @return Obstacle[]
     */
    public function findByShopAndType(Shop $shop, string $type): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.shop = :shop')
            ->andWhere('o.type = :type')
            ->setParameter('shop', $shop)
            ->setParameter('type', $type)
            ->orderBy('o.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
