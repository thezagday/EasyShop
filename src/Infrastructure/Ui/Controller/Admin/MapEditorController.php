<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Repository\ShopRepositoryInterface;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/map-editor', name: 'admin_map_editor_')]
#[IsGranted('ROLE_ADMIN')]
class MapEditorController extends AbstractController
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository,
        private AdminUrlGenerator $adminUrlGenerator
    ) {
    }

    #[Route('/{id}', name: 'edit', methods: ['GET'])]
    public function edit(int $id): Response
    {
        $shop = $this->shopRepository->findById($id);

        if (!$shop) {
            throw $this->createNotFoundException('Shop not found');
        }

        // Backwards-compatible entrypoint: redirect to the EasyAdmin CRUD custom action.
        // This ensures a real AdminContext is created, fixing the i18n error.
        return $this->redirect(
            $this->adminUrlGenerator
                ->setController(ShopCrudController::class)
                ->setAction('editMap')
                ->setEntityId($id)
                ->generateUrl()
        );
    }
}
