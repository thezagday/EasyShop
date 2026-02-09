<?php

namespace App\Infrastructure\Persistence\Repository;

use App\Domain\Entity\UserActivity;
use App\Domain\Repository\UserActivityRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserActivity>
 */
class UserActivityRepository extends ServiceEntityRepository implements UserActivityRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserActivity::class);
    }

    public function findById(int $id): ?UserActivity
    {
        return parent::find($id);
    }

    public function save(UserActivity $activity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($activity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
