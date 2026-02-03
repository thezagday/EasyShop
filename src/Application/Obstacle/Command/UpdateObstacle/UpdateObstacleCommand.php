<?php

namespace App\Application\Obstacle\Command\UpdateObstacle;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class UpdateObstacleCommand implements CommandInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $id,

        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $shopId,

        #[Assert\PositiveOrZero]
        private readonly ?int $x = null,

        #[Assert\PositiveOrZero]
        private readonly ?int $y = null,

        #[Assert\Positive]
        private readonly ?int $width = null,

        #[Assert\Positive]
        private readonly ?int $height = null,

        #[Assert\Choice(choices: ['shelf', 'wall', 'counter', 'checkout'])]
        private readonly ?string $type = null,
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

    public function getX(): ?int
    {
        return $this->x;
    }

    public function getY(): ?int
    {
        return $this->y;
    }

    public function getWidth(): ?int
    {
        return $this->width;
    }

    public function getHeight(): ?int
    {
        return $this->height;
    }

    public function getType(): ?string
    {
        return $this->type;
    }
}
