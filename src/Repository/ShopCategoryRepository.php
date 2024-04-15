<?php

namespace App\Repository;

use App\Entity\ShopCategory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ShopCategory>
 *
 * @method ShopCategory|null find($id, $lockMode = null, $lockVersion = null)
 * @method ShopCategory|null findOneBy(array $criteria, array $orderBy = null)
 * @method ShopCategory[]    findAll()
 * @method ShopCategory[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShopCategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShopCategory::class);
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
