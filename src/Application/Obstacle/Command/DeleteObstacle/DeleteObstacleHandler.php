<?php

namespace App\Application\Obstacle\Command\DeleteObstacle;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Repository\ObstacleRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class DeleteObstacleHandler implements CommandHandlerInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ObstacleRepositoryInterface $obstacleRepository
    ) {
    }

    public function __invoke(DeleteObstacleCommand $command): mixed
    {
        $obstacle = $this->obstacleRepository->findById($command->id);

        if (!$obstacle || $obstacle->getShop()->getId() !== $command->shopId) {
            throw new NotFoundHttpException('Obstacle not found');
        }

        $this->entityManager->remove($obstacle);
        $this->entityManager->flush();

        return null;
    }
}
