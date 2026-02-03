<?php

namespace App\Application\Obstacle\Command\UpdateObstacle;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Entity\Obstacle;
use App\Domain\Repository\ObstacleRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class UpdateObstacleHandler implements CommandHandlerInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ObstacleRepositoryInterface $obstacleRepository
    ) {
    }

    public function __invoke(UpdateObstacleCommand $command): Obstacle
    {
        $obstacle = $this->obstacleRepository->findById($command->getId());

        if (!$obstacle || $obstacle->getShop()->getId() !== $command->getShopId()) {
            throw new NotFoundHttpException('Obstacle not found');
        }

        if ($command->getX() !== null) {
            $obstacle->setX($command->getX());
        }
        if ($command->getY() !== null) {
            $obstacle->setY($command->getY());
        }
        if ($command->getWidth() !== null) {
            $obstacle->setWidth($command->getWidth());
        }
        if ($command->getHeight() !== null) {
            $obstacle->setHeight($command->getHeight());
        }
        if ($command->getType() !== null) {
            $obstacle->setType($command->getType());
        }

        $this->entityManager->flush();

        return $obstacle;
    }
}
