<?php

namespace App\Application\Obstacle\Command\CreateObstacle;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class CreateObstacleCommand implements CommandInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $shopId,

        #[Assert\NotBlank]
        #[Assert\PositiveOrZero]
        private readonly int $x,

        #[Assert\NotBlank]
        #[Assert\PositiveOrZero]
        private readonly int $y,

        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $width,

        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $height,

        #[Assert\NotBlank]
        #[Assert\Choice(choices: ['shelf', 'wall', 'counter', 'checkout'])]
        private readonly string $type = 'shelf',
    ) {
    }

    public function getShopId(): int
    {
        return $this->shopId;
    }

    public function getX(): int
    {
        return $this->x;
    }

    public function getY(): int
    {
        return $this->y;
    }

    public function getWidth(): int
    {
        return $this->width;
    }

    public function getHeight(): int
    {
        return $this->height;
    }

    public function getType(): string
    {
        return $this->type;
    }
}
