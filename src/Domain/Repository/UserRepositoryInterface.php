<?php

namespace App\Domain\Repository;

use App\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function save(User $user, bool $flush = false): void;
    public function remove(User $user, bool $flush = false): void;
}
