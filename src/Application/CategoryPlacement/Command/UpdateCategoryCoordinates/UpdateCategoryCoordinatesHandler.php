<?php

namespace App\Application\CategoryPlacement\Command\UpdateCategoryCoordinates;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Repository\ShopCategoryRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class UpdateCategoryCoordinatesHandler implements CommandHandlerInterface
{
    public function __construct(
        private ShopCategoryRepositoryInterface $shopCategoryRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    public function __invoke(UpdateCategoryCoordinatesCommand $command): array
    {
        $shopCategory = $this->shopCategoryRepository->findById($command->id);

        if (!$shopCategory || $shopCategory->getShop()?->getId() !== $command->shopId) {
            throw new NotFoundHttpException('ShopCategory not found');
        }

        $shopCategory->setXCoordinate($command->x_coordinate);
        $shopCategory->setYCoordinate($command->y_coordinate);

        $this->entityManager->flush();

        return [
            'id' => $shopCategory->getId(),
            'category_title' => $shopCategory->getCategory()?->getTitle() ?? 'N/A',
            'x_coordinate' => $shopCategory->getXCoordinate(),
            'y_coordinate' => $shopCategory->getYCoordinate(),
        ];
    }
}
