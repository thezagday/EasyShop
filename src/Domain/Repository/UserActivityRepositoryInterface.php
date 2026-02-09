<?php

namespace App\Domain\Repository;

use App\Domain\Entity\UserActivity;

interface UserActivityRepositoryInterface
{
    public function findById(int $id): ?UserActivity;
    public function save(UserActivity $activity, bool $flush = false): void;
}
