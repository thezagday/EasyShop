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
        $obstacle = $this->obstacleRepository->findById($command->id);

        if (!$obstacle || $obstacle->getShop()->getId() !== $command->shopId) {
            throw new NotFoundHttpException('Obstacle not found');
        }

        if ($command->x !== null) {
            $obstacle->setX($command->x);
        }
        if ($command->y !== null) {
            $obstacle->setY($command->y);
        }
        if ($command->width !== null) {
            $obstacle->setWidth($command->width);
        }
        if ($command->height !== null) {
            $obstacle->setHeight($command->height);
        }
        if ($command->type !== null) {
            $obstacle->setType($command->type);
        }

        $this->entityManager->flush();

        return $obstacle;
    }
}
