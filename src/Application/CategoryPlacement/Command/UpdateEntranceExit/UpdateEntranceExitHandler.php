<?php

namespace App\Application\CategoryPlacement\Command\UpdateEntranceExit;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Repository\ShopRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class UpdateEntranceExitHandler implements CommandHandlerInterface
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    public function __invoke(UpdateEntranceExitCommand $command): array
    {
        $shop = $this->shopRepository->findById($command->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        if ($command->entranceX !== null) {
            $shop->setEntranceX($command->entranceX);
        }
        if ($command->entranceY !== null) {
            $shop->setEntranceY($command->entranceY);
        }
        if ($command->exitX !== null) {
            $shop->setExitX($command->exitX);
        }
        if ($command->exitY !== null) {
            $shop->setExitY($command->exitY);
        }

        $this->entityManager->flush();

        return [
            'entranceX' => $shop->getEntranceX(),
            'entranceY' => $shop->getEntranceY(),
            'exitX' => $shop->getExitX(),
            'exitY' => $shop->getExitY(),
        ];
    }
}
