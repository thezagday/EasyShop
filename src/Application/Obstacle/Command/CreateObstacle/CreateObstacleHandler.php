<?php

namespace App\Application\Obstacle\Command\CreateObstacle;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Entity\Obstacle;
use App\Domain\Factory\ObstacleFactory;
use App\Domain\Repository\ShopRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class CreateObstacleHandler implements CommandHandlerInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ShopRepositoryInterface $shopRepository,
        private ObstacleFactory $obstacleFactory
    ) {
    }

    public function __invoke(CreateObstacleCommand $command): Obstacle
    {
        $shop = $this->shopRepository->findById($command->getShopId());

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        $obstacle = $this->obstacleFactory->createFromCommand($command, $shop);

        $this->entityManager->persist($obstacle);
        $this->entityManager->flush();

        return $obstacle;
    }
}
