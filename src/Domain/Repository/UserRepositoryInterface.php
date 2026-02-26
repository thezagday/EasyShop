<?php

namespace App\Domain\Repository;

use App\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function findAdminByEmail(string $email): ?User;
    public function findMainUserByEmail(string $email): ?User;
    public function save(User $user, bool $flush = false): void;
    public function remove(User $user, bool $flush = false): void;
}
