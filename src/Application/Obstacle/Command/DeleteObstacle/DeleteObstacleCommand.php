<?php

namespace App\Application\Obstacle\Command\DeleteObstacle;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class DeleteObstacleCommand implements CommandInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $id,

        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $shopId,
    ) {
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getShopId(): int
    {
        return $this->shopId;
    }
}
