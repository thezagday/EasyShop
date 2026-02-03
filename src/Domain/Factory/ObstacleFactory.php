<?php

namespace App\Domain\Factory;

use App\Application\Obstacle\Command\CreateObstacle\CreateObstacleCommand;
use App\Domain\Entity\Obstacle;
use App\Domain\Entity\Shop;

class ObstacleFactory
{
    public function createFromCommand(CreateObstacleCommand $command, Shop $shop): Obstacle
    {
        $obstacle = new Obstacle();
        $obstacle->setShop($shop);
        $obstacle->setX($command->x);
        $obstacle->setY($command->y);
        $obstacle->setWidth($command->width);
        $obstacle->setHeight($command->height);
        $obstacle->setType($command->type);

        return $obstacle;
    }

    public function createEmpty(): Obstacle
    {
        return new Obstacle();
    }
}
