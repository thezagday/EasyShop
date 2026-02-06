<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopCategory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/shops/{shopId}', name: 'api_placement_')]
class CategoryPlacementController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    #[Route('/categories', name: 'categories_list', methods: ['GET'])]
    public function listCategories(int $shopId): JsonResponse
    {
        $shop = $this->entityManager->getRepository(Shop::class)->find($shopId);

        if (!$shop) {
            return $this->json(['error' => 'Shop not found'], Response::HTTP_NOT_FOUND);
        }

        $shopCategories = $this->entityManager->getRepository(ShopCategory::class)->findBy(['shop' => $shop]);

        $data = array_map(function (ShopCategory $sc) {
            return [
                'id' => $sc->getId(),
                'category_title' => $sc->getCategory()?->getTitle() ?? 'N/A',
                'x_coordinate' => $sc->getXCoordinate(),
                'y_coordinate' => $sc->getYCoordinate(),
            ];
        }, $shopCategories);

        return $this->json($data);
    }

    #[Route('/categories/{id}/coordinates', name: 'category_update_coords', methods: ['PUT'])]
    public function updateCategoryCoordinates(int $shopId, int $id, Request $request): JsonResponse
    {
        $shopCategory = $this->entityManager->getRepository(ShopCategory::class)->find($id);

        if (!$shopCategory || $shopCategory->getShop()?->getId() !== $shopId) {
            return $this->json(['error' => 'ShopCategory not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['x_coordinate']) || !isset($data['y_coordinate'])) {
            return $this->json(['error' => 'x_coordinate and y_coordinate are required'], Response::HTTP_BAD_REQUEST);
        }

        $shopCategory->setXCoordinate((float) $data['x_coordinate']);
        $shopCategory->setYCoordinate((float) $data['y_coordinate']);

        $this->entityManager->flush();

        return $this->json([
            'id' => $shopCategory->getId(),
            'category_title' => $shopCategory->getCategory()?->getTitle() ?? 'N/A',
            'x_coordinate' => $shopCategory->getXCoordinate(),
            'y_coordinate' => $shopCategory->getYCoordinate(),
        ]);
    }

    #[Route('/entrance-exit', name: 'entrance_exit_get', methods: ['GET'])]
    public function getEntranceExit(int $shopId): JsonResponse
    {
        $shop = $this->entityManager->getRepository(Shop::class)->find($shopId);

        if (!$shop) {
            return $this->json(['error' => 'Shop not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'entranceX' => $shop->getEntranceX(),
            'entranceY' => $shop->getEntranceY(),
            'exitX' => $shop->getExitX(),
            'exitY' => $shop->getExitY(),
        ]);
    }

    #[Route('/entrance-exit', name: 'entrance_exit_update', methods: ['PUT'])]
    public function updateEntranceExit(int $shopId, Request $request): JsonResponse
    {
        $shop = $this->entityManager->getRepository(Shop::class)->find($shopId);

        if (!$shop) {
            return $this->json(['error' => 'Shop not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (array_key_exists('entranceX', $data)) {
            $shop->setEntranceX($data['entranceX'] !== null ? (float) $data['entranceX'] : null);
        }
        if (array_key_exists('entranceY', $data)) {
            $shop->setEntranceY($data['entranceY'] !== null ? (float) $data['entranceY'] : null);
        }
        if (array_key_exists('exitX', $data)) {
            $shop->setExitX($data['exitX'] !== null ? (float) $data['exitX'] : null);
        }
        if (array_key_exists('exitY', $data)) {
            $shop->setExitY($data['exitY'] !== null ? (float) $data['exitY'] : null);
        }

        $this->entityManager->flush();

        return $this->json([
            'entranceX' => $shop->getEntranceX(),
            'entranceY' => $shop->getEntranceY(),
            'exitX' => $shop->getExitX(),
            'exitY' => $shop->getExitY(),
        ]);
    }
}
