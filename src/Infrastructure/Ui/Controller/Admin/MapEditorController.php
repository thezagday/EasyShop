<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/admin/map-editor', name: 'admin_map_editor_')]
class MapEditorController extends AbstractController
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository
    ) {
    }

    #[Route('/{id}', name: 'edit', methods: ['GET'])]
    public function edit(int $id): Response
    {
        $shop = $this->shopRepository->findById($id);

        if (!$shop) {
            throw $this->createNotFoundException('Shop not found');
        }

        $mapImage = $shop->getMapImage();
        
        if (!$mapImage) {
            $this->addFlash('warning', 'Для этого магазина не загружена карта. Пожалуйста, загрузите карту в поле "Имя файла карты магазина".');
            return $this->redirectToRoute('admin', [
                'crudAction' => 'edit',
                'crudControllerFqcn' => 'App\\Infrastructure\\Ui\\Controller\\Admin\\ShopCrudController',
                'entityId' => $id,
            ]);
        }

        return $this->render('admin/map_editor/edit.html.twig', [
            'shop' => $shop,
            'mapImageUrl' => '/img/' . $mapImage,
            'mapWidth' => 1653, // TODO: можно добавить эти параметры в Shop entity
            'mapHeight' => 993,
        ]);
    }
}
