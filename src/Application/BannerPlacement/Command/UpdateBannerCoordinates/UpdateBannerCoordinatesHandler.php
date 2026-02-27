<?php

namespace App\Application\BannerPlacement\Command\UpdateBannerCoordinates;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Repository\ShopBannerRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class UpdateBannerCoordinatesHandler implements CommandHandlerInterface
{
    public function __construct(
        private readonly ShopBannerRepositoryInterface $shopBannerRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    public function __invoke(UpdateBannerCoordinatesCommand $command): array
    {
        $banner = $this->shopBannerRepository->findById($command->id);

        if (!$banner || $banner->getShop()?->getId() !== $command->shopId) {
            throw new NotFoundHttpException('Shop banner not found');
        }

        $banner->setXCoordinate($command->x_coordinate);
        $banner->setYCoordinate($command->y_coordinate);

        $this->entityManager->flush();

        return [
            'id' => $banner->getId(),
            'title' => $banner->getTitle(),
            'imageUrl' => $banner->getResolvedImageUrl(),
            'imageFile' => $banner->getImageFile(),
            'targetUrl' => $banner->getTargetUrl(),
            'active' => $banner->isActive(),
            'sortOrder' => $banner->getSortOrder(),
            'x_coordinate' => $banner->getXCoordinate(),
            'y_coordinate' => $banner->getYCoordinate(),
        ];
    }
}
