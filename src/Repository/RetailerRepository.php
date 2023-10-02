<?php

namespace App\Repository;

use App\Entity\Retailer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Retailer>
 *
 * @method Retailer|null find($id, $lockMode = null, $lockVersion = null)
 * @method Retailer|null findOneBy(array $criteria, array $orderBy = null)
 * @method Retailer[]    findAll()
 * @method Retailer[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RetailerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Retailer::class);
    }

//    /**
//     * @return Retailer[] Returns an array of Retailer objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('r.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Retailer
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
