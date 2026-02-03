<?php

namespace App\Application\Obstacle\Command\CreateObstacle;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class CreateObstacleCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    public int $x;

    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    public int $y;

    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $width;

    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $height;

    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['shelf', 'wall', 'counter', 'checkout'])]
    public string $type = 'shelf';
}

