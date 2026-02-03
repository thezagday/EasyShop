<?php

namespace App\Application\Obstacle\Query\GetObstacles;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetObstaclesQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    #[Assert\Choice(choices: ['shelf', 'wall', 'counter', 'checkout'])]
    public ?string $type = null;
}

