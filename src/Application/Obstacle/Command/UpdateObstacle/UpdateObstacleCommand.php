<?php

namespace App\Application\Obstacle\Command\UpdateObstacle;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class UpdateObstacleCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $id;

    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    #[Assert\PositiveOrZero]
    public ?int $x = null;

    #[Assert\PositiveOrZero]
    public ?int $y = null;

    #[Assert\Positive]
    public ?int $width = null;

    #[Assert\Positive]
    public ?int $height = null;

    #[Assert\Choice(choices: ['shelf', 'wall', 'counter', 'checkout'])]
    public ?string $type = null;
}

