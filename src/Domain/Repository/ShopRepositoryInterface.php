<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Shop;

interface ShopRepositoryInterface
{
    public function findById(int $id): ?Shop;
    public function save(Shop $shop, bool $flush = false): void;
    public function remove(Shop $shop, bool $flush = false): void;
}
