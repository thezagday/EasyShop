<?php

namespace App\Infrastructure\Persistence\Repository;

use App\Domain\Entity\ShopCategory;
use App\Domain\Repository\ShopCategoryRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ShopCategory>
 */
class ShopCategoryRepository extends ServiceEntityRepository implements ShopCategoryRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShopCategory::class);
    }

    public function findById(int $id): ?ShopCategory
    {
        return parent::find($id);
    }

    public function save(ShopCategory $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ShopCategory $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return ShopCategory[] Returns an array of ShopCategory objects
     */
    public function getShopToCoordinatesByPath(array $shops): array
    {
        return $this->createQueryBuilder('sc')
            ->innerJoin('sc.category', 'c')
            ->andWhere('c.title IN (:titles)')
            ->setParameter('titles', $shops)
            ->getQuery()
            ->getResult()
        ;
    }
}
