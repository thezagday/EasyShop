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
        $obstacle->setX($command->getX());
        $obstacle->setY($command->getY());
        $obstacle->setWidth($command->getWidth());
        $obstacle->setHeight($command->getHeight());
        $obstacle->setType($command->getType());

        return $obstacle;
    }

    public function createEmpty(): Obstacle
    {
        return new Obstacle();
    }
}
