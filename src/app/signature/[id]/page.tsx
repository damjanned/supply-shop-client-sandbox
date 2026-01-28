import PageContainer from "@/components/PageContainer";

type SignatureDetails = {
  Signature_Name: string;
  Signature_Position: string;
  Signature_Email: string;
  Signature_Phone: string;
  Signature_Address: string;
};

async function getSignatureDetails(id: string) {
  return fetch(`${process.env.BASE_URL}/api/signature/get/${id}`, {
    cache: "no-store",
  })
    .then<{ data: SignatureDetails }>((res) => res.json())
    .then(({ data }) => data)
    .catch((err) => {
      console.log(err);
      return undefined;
    });
}

type Props = {
  params: {
    id: string;
  };
};

export default async function Signature({ params }: Props) {
  const signatureDetails = await getSignatureDetails(params.id);

  return (
    <PageContainer>
      {signatureDetails ? (
        <>
          <div className="text-pova-heading font-bold mt-5">Signature</div>
          <div className="text-3xl font-semibold mb-2 mt-8">
            {signatureDetails.Signature_Name}
          </div>
          <div className="text-lg mb-8">
            {signatureDetails.Signature_Position}
          </div>
          <div className="space-y-4">
            <div className="font-semibold">
              <a
                href={`mailto:${signatureDetails.Signature_Email}`}
                target="_blank"
                className="cursor-pointer"
              >
                {signatureDetails.Signature_Email}
              </a>
            </div>
            <div className="font-semibold">
              M.&nbsp;
              <a
                href={`tel:${signatureDetails.Signature_Phone}`}
                target="_blank"
                className="cursor-pointer"
              >
                {signatureDetails.Signature_Phone}
              </a>
            </div>
            <div>{signatureDetails.Signature_Address}</div>
          </div>
        </>
      ) : (
        <div className="mt-28 text-center text-lg">Signature Not Found</div>
      )}
    </PageContainer>
  );
}
