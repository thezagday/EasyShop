<?php

namespace App\Application\Obstacle\Query\GetObstacles;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetObstaclesQuery implements QueryInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $shopId,

        #[Assert\Choice(choices: ['shelf', 'wall', 'counter', 'checkout'])]
        private readonly ?string $type = null,
    ) {
    }

    public function getShopId(): int
    {
        return $this->shopId;
    }

    public function getType(): ?string
    {
        return $this->type;
    }
}
