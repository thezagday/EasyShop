<?php

namespace App\Application\CategoryPlacement\Query\GetEntranceExit;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class GetEntranceExitHandler implements QueryHandlerInterface
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository
    ) {
    }

    public function __invoke(GetEntranceExitQuery $query): array
    {
        $shop = $this->shopRepository->findById($query->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        return [
            'entranceX' => $shop->getEntranceX(),
            'entranceY' => $shop->getEntranceY(),
            'exitX' => $shop->getExitX(),
            'exitY' => $shop->getExitY(),
        ];
    }
}
