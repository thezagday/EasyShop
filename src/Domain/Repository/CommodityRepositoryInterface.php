<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Commodity;

interface CommodityRepositoryInterface
{
    public function findById(int $id): ?Commodity;
    public function save(Commodity $commodity, bool $flush = false): void;
    public function remove(Commodity $commodity, bool $flush = false): void;
}
