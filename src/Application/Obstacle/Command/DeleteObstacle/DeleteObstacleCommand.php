<?php

namespace App\Application\Obstacle\Command\DeleteObstacle;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class DeleteObstacleCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $id;

    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;
}

